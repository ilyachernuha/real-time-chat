import { useRouter } from "expo-router";
import BackButton from "@/components/buttons/BackButton";
import { Header } from "@/components/Header";
import { Image } from "react-native";

type Props = {
  title: string;
};

export const ChatHeader = ({ title }: Props) => {
  const router = useRouter();

  return (
    <Header
      title={title}
      left={<BackButton onPress={() => router.back()}>Back</BackButton>}
      right={
        <Image
          source={require("../../../../../assets/images/icon.png")}
          width={44}
          height={44}
          style={{ width: 44, height: 44, borderRadius: 12 }}
        />
      }
    />
  );
};
