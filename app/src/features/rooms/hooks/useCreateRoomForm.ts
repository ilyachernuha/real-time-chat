import { useCreateRoom } from "@/features/rooms/hooks/useCreateRoom";
import { CreateRoomFormData, createRoomSchema } from "@/features/rooms/validators/createRoomSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const useCreateRoomForm = () => {
  const { createRoom } = useCreateRoom();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      title: "",
      description: "",
      // @ts-ignore
      theme: "",
      languages: [],
      tags: [],
      make_public: false,
    },
  });

  const submit = handleSubmit(async (data) => {
    const error = await createRoom(data);

    if (error) {
      setError(error.field, { message: error.detail });
    }
  });

  return { control, submit, isSubmitting };
};
