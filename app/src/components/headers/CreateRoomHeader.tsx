import { useRouter } from "expo-router";
import Header from "./Header";
import BackButton from "../buttons/BackButton";

export default function CreateRoomHeader() {
  const router = useRouter();
  return <Header title="Create Room" left={<BackButton onPress={() => router.back()}>Back</BackButton>} />;
}
