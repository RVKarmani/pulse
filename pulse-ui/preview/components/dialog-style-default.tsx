import { Button } from "@/components/retroui/Button";
import { Dialog } from "@/components/retroui/Dialog";
import { Text } from "@/components/retroui/Text";

export default function DialogStyleDefault() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Open Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Text as="h5">Confirm your action?</Text>
        </Dialog.Header>
        <section className="flex flex-col gap-4 p-4">
          <section className="text-xl">
            <p>Are you sure you want to delete this item?</p>
            <p>This action cannout be undone.</p>
          </section>
          <section className="flex w-full justify-end">
            <Dialog.Trigger asChild>
              <Button>Confirm</Button>
            </Dialog.Trigger>
          </section>
        </section>
      </Dialog.Content>
    </Dialog>
  );
}
