"use client"

import { useState, useEffect } from "react"
 
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from "@/context/useUserContext"
import { motion } from "framer-motion"
import { useChangePassword } from "@/hooks/authentication"
import { Icon } from '@mdi/react'
import { mdiShieldLock } from '@mdi/js'

const passwordSchema = z.object({
  oldPassword: z.string().min(6, "Mật khẩu cũ phải có ít nhất 6 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp với mật khẩu mới",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

function PasswordStrengthIndicator({ password }: { password: string }) {
  const [strength, setStrength] = useState(0)
  const [message, setMessage] = useState("Nhập mật khẩu mới")

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setMessage("Nhập mật khẩu mới")
      return
    }

    let currentStrength = 0

    if (password.length >= 8) currentStrength += 20
    if (password.length >= 12) currentStrength += 10

    if (/[a-z]/.test(password)) currentStrength += 10
    if (/[A-Z]/.test(password)) currentStrength += 15
    if (/[0-9]/.test(password)) currentStrength += 15
    if (/[^a-zA-Z0-9]/.test(password)) currentStrength += 20

    const commonPatterns = /123456|password|qwerty|abc123/i
    if (commonPatterns.test(password)) {
      currentStrength = Math.max(currentStrength - 30, 0)
    }

    setStrength(currentStrength)

    if (currentStrength < 40) {
      setMessage("Mật khẩu yếu")
    } else if (currentStrength < 70) {
      setMessage("Mật khẩu trung bình")
    } else {
      setMessage("Mật khẩu mạnh")
    }
  }, [password])

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            strength < 40 ? "bg-red-500" : 
            strength < 70 ? "bg-yellow-500" : 
            "bg-green-500"
          } transition-all duration-300`}
          style={{ width: `${Math.min(strength, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1 text-maintext dark:text-maintext">
        {message}
      </p>
    </div>
  )
}

function ChangePasswordForm() {
  const navigate = useNavigate()
  const changePasswordMutation = useChangePassword()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: (data as any).oldPassword,
        newPassword: (data as any).newPassword,
      })
      
      toast.success("Đổi mật khẩu thành công")
      
      setTimeout(() => {
        navigate("/profile")
      }, 2000)
    } catch (error: any) {
      console.error("Lỗi đổi mật khẩu:", error)
      toast.error("Đổi mật khẩu thất bại")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-maintext dark:text-gray-300 font-medium">Mật khẩu hiện tại</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại"
                    {...field}
                    className="border-gray-300 dark:border-gray-700 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maintext hover:text-maintext focus:outline-none"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-maintext dark:text-gray-300 font-medium">Mật khẩu mới</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    {...field}
                    className="border-gray-300 dark:border-gray-700 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maintext hover:text-maintext focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <PasswordStrengthIndicator password={field.value} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-maintext dark:text-gray-300 font-medium">Xác nhận mật khẩu mới</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    {...field}
                    className="border-gray-300 dark:border-gray-700 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maintext hover:text-maintext focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            className="bg-primary hover:bg-secondary transition-all duration-300 text-base font-semibold w-full py-4"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang đổi mật khẩu...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useUser()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login")
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại hồ sơ
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon path={mdiShieldLock} size={1.2} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-maintext dark:text-white">Đổi mật khẩu</h1>
          </div>
          <p className="text-maintext dark:text-maintext">
            Bảo vệ tài khoản của bạn với mật khẩu mạnh và bảo mật
          </p>
        </div>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle>Thay đổi mật khẩu</CardTitle>
            <CardDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ChangePasswordPage
