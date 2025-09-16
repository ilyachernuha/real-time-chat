import { useRouter } from "expo-router";
import BackButton from "@/components/buttons/BackButton";
import { Header } from "@/components/Header";
import { Image } from "expo-image";
import API from "@/constants/API";
import Room from "@/model/Room";

type Props = {
  room: Room;
};

export const ChatHeader = ({ room: { title, pictureId } }: Props) => {
  const router = useRouter();

  return (
    <Header
      title={title}
      left={<BackButton onPress={() => router.back()}>Back</BackButton>}
      right={
        <Image
          source={
            pictureId
              ? `${API.apiURL}/room-pictures/100p/${pictureId}.jpeg`
              : require("../../../../../assets/images/icon.png")
          }
          style={{ width: 44, height: 44, borderRadius: 12, aspectRatio: 1 / 1 }}
          placeholder={require("../../../../../assets/images/icon.png")}
        />
      }
    />
  );
};
