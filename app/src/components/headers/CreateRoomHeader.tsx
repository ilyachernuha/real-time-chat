import { useRouter } from "expo-router";
import Header from "@/components/headers/Header";
import BackButton from "@/components/common/buttons/BackButton";

export default function CreateRoomHeader() {
  const router = useRouter();
  return <Header title="Create Room" left={<BackButton onPress={() => router.back()}>Back</BackButton>} />;
}
