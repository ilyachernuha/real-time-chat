import { ActivityIndicator, View, Text } from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { roomsApi } from "../../services/roomsApi";
import Attachment from "@/model/Attachment";

type Props = {
  attachment: Attachment;
};

export const AttachmentImage = ({ attachment: { id, server_id, uri: localUri } }: Props) => {
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);

        // 1. Try fetch from cache
        const uri = await Image.getCachePathAsync(id);
        if (uri && !cancelled) return setSource(uri);

        // 2. Try fetch from remote
        if (server_id) {
          const { presigned_url } = await roomsApi.getAttachment(server_id);
          if (!cancelled) return setSource(presigned_url);
        }
        // 3. Try fetch from local fs
        if (localUri) return setSource(localUri);
      } catch (e) {
        if (!cancelled) setError("Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error)
    return (
      <View
        style={{
          width: "100%",
          aspectRatio: 1 / 1,
          backgroundColor: "#eee",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>{error}</Text>
      </View>
    );
  if (!source) return <ActivityIndicator style={{ width: "100%", aspectRatio: 1 / 1 }} />;

  return (
    <Image
      style={{ flex: 1, width: "100%", backgroundColor: "#0553", aspectRatio: 1 / 1 }}
      source={{ uri: source, cacheKey: id }}
      contentFit="cover"
    />
  );
};
