import { Alert } from "@/components/retroui/Alert";

export default function AlertStyleDefault() {
  return (
    <Alert variant="solid">
      <Alert.Title>Heads up!</Alert.Title>
      <Alert.Description>
        This is where you can write description that no one reads...
      </Alert.Description>
    </Alert>
  );
}
