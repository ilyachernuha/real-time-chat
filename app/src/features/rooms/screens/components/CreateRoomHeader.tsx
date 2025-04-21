import { useRouter } from "expo-router";
import BackButton from "@/components/buttons/BackButton";
import { Header } from "@/components/Header";

export default function CreateRoomHeader() {
  const router = useRouter();
  return <Header title="Create Room" left={<BackButton onPress={() => router.back()}>Back</BackButton>} />;
}
