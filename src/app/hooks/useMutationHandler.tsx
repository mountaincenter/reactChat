import { type UseMutationResult } from "@tanstack/react-query";
import { useToast } from "~/components/ui/use-toast";

interface UseMutationHandlerProps<TData, TVariables> {
  mutation: UseMutationResult<TData, unknown, TVariables, unknown>;
  successMessage: string;
  errorMessage: string;
}

export const useMutationHandler = <TData, TVariables>({
  mutation,
  successMessage,
}: UseMutationHandlerProps<TData, TVariables>) => {
  const { toast } = useToast();

  const { mutate, status } = mutation;

  const handleMutation = (data: TVariables) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: successMessage,
          duration: 3000,
        });

        console.log("Mutation successful, trigger UI update");
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred"; // ここでerrorMessageが使用されている
        console.error("Error during mutation:", errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          duration: 3000,
        });
      },
    });
  };

  const isLoading = status === "pending";

  return { handleMutation, isLoading };
};
