import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/login";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
  });
};