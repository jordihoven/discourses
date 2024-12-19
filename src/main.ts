import './assets/main.css'
import 'toaster-ts/dist/bundle.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// TODO: move icons import to it's own file...
import {
  Hourglass,
  Sparkles,
  Calendar,
  Clapperboard,
  Star,
  Search,
  RemoveFormatting,
  Mailbox,
  Copy,
  Link,
  LogOut,
  Pencil,
  Loader,
  Feather,
  Archive
} from 'lucide-vue-next'

// icons to use in the app...
app.component('LucideHourglass', Hourglass)
app.component('LucideSparkles', Sparkles)
app.component('LucideCalendar', Calendar)
app.component('LucideClapperboard', Clapperboard)
app.component('LucideStar', Star)
app.component('LucideSearch', Search)
app.component('LucideRemoveFormatting', RemoveFormatting)
app.component('LucideMailbox', Mailbox)
app.component('LucideCopy', Copy)
app.component('LucideLink', Link)
app.component('LucideLogOut', LogOut)
app.component('LucidePencil', Pencil)
app.component('LucideLoader', Loader)
app.component('LucideArchive', Archive)
app.component('LucideFeather', Feather)

app.use(createPinia())
app.use(router)

app.mount('#app')
