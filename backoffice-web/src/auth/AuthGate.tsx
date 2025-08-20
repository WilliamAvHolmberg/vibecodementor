import { Box, Button, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from './authContext'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <Typography color="text.secondary">Checking authentication…</Typography>
      </Box>
    )
  }
  if (!isAuthenticated) {
    return <AuthForm />
  }
  return <>{children}</>
}

function AuthForm() {
  const { sendOtp, verifyOtp, otpStep, otpEmail, error, clearError, backToEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const emailTrimmed = email.trim()
  const isEmailValid = emailTrimmed.includes('@')
  const codeTrimmed = code.trim()

  const onSend = async () => {
    clearError()
    if (!isEmailValid) return
    await sendOtp(emailTrimmed)
  }
  const onVerify = async () => {
    await verifyOtp(otpEmail ?? emailTrimmed, codeTrimmed)
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <Paper sx={{ p: 3, minWidth: 360 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Sign in</Typography>
          {otpStep !== 'email-sent' ? (
            <>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (isEmailValid) void onSend()
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title={email && !isEmailValid ? 'Enter a valid email address' : null}>
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    <Button variant="contained" onClick={onSend} disabled={!isEmailValid}>Send OTP</Button>
                  </Box>
                </Tooltip>
              </Box>
            </>
          ) : (
            <>
              <Typography color="text.secondary" variant="body2">We sent a code to {otpEmail}</Typography>
              <TextField
                label="One-time code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (codeTrimmed) void onVerify()
                  }
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button onClick={backToEmail}>Back</Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" onClick={onVerify} disabled={!codeTrimmed}>Verify</Button>
              </Stack>
            </>
          )}
          {error ? (
            <Typography color="error" variant="body2">{error}</Typography>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  )
}



