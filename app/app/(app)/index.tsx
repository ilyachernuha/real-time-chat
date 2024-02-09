import Button from "../../src/components/UI/Button";
import { colors } from "../../src/config/theme";
import { StyleSheet, View } from "react-native";
import { useSession } from "../../src/ctx";

const Home = () => {
  const { signOut } = useSession();
  return (
    <View style={styles.container}>
      <Button title="Exit" onPress={signOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.main.black,
  },
});

export default Home;
