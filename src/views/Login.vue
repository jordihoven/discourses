<template>
  <div class="login">
    <h3>Let's start writing</h3>
    <span>Confirm your email to continue</span>

    <!-- Email Input -->
    <div class="email-step" v-if="step === 'email'">
      <input v-model="email" ref="emailInput" type="email" placeholder="Enter your email" @keydown.enter="sendCode" />
      <button @click="sendCode">Continue</button>
    </div>

    <!-- Code Input -->
    <div class="email-step" v-if="step === 'code'">
      <input v-model="code" ref="codeInput" type="text" placeholder="Code from email" @keydown.enter="verifyCode" />
      <button @click="verifyCode">Login</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'toaster-ts'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const email = ref('')
    const code = ref('')
    const error = ref('')
    const step = ref('email')
    const router = useRouter() // Access router

    const emailInput = ref(null)
    const codeInput = ref(null)

    // Autofocus on the email input field when the component mounts
    onMounted(() => {
      if (emailInput.value) {
        emailInput.value.focus()
      }
    })

    // Send the code to the user's email
    const sendCode = async () => {
      try {
        const { error: sendError } = await supabase.auth.signInWithOtp({
          email: email.value
        })

        if (sendError) {
          error.value = sendError.message
          toast.error(error.value)
        } else {
          step.value = 'code' // Move to the code entry step
          error.value = '' // Clear any previous errors
          toast.success(`Code sent to ${email.value} ✨`)
          await nextTick() // Wait for DOM update
          if (codeInput.value) {
            codeInput.value.focus() // Autofocus on the code input field
          }
        }
      } catch (err) {
        error.value = 'Something went wrong. Please try again 💀'
        toast.error(error.value)
      }
    }

    // Verify the code entered by the user
    const verifyCode = async () => {
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.value,
          token: code.value,
          type: 'email'
        })

        if (verifyError) {
          error.value = verifyError.message
          toast.error(error.value)
        } else {
          error.value = '' // Clear any previous errors
          toast.success('You are now logged in 🎉')
          router.push({ name: 'LetterComposer' })
        }
      } catch (err) {
        error.value = 'Something went wrong during verification 💀'
        toast.error(error.value)
      }
    }

    return {
      email,
      code,
      sendCode,
      verifyCode,
      error,
      step,
      emailInput,
      codeInput
    }
  }
}
</script>

<style scoped>
.login {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
  align-items: center;
  padding-top: 6em;
}

.email-step {
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
}

.email-step button {
  justify-content: center;
}

.email-step input {
  font-size: var(--body);
}
</style>
