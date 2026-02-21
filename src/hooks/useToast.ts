import { toast } from 'sonner'

export const useToast = () => ({
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast(msg),
  loading: (msg: string) => toast.loading(msg),
  promise: toast.promise,
})
