<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'

import { Checkbox } from '@/components/ui/checkbox'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'

import { Plus, Github, Trash2, Star } from 'lucide-vue-next'

import { User } from './types/user'
import { API_URL } from './main'

const { toast } = useToast()

const errorToast = (message: string) => {
  toast({
    title: "Error",
    description: message,
    duration: 3000,
    variant: "destructive",
  })
}

const sorted = ref<boolean>(false)
const username = ref<string>('')
const users = ref<User[]>([])

const checkAndSortUsers = (array: User[]) => {
  array.sort((a, b) => sorted.value ? (a.name ?? a.username).localeCompare(b.name ?? b.username) : a.created_at.localeCompare(b.created_at))
}

const getAndUpdateUsersList = async () => {
  try {
    const response = await fetch(`${API_URL}/users`)
    const json = (await response.json()) as { data: { users: User[] } }

    checkAndSortUsers(json.data.users)
    users.value = json.data.users
  } catch {
    errorToast("Trying to fetch the users")
  }
}

const deleteUser = async (username: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${username}`, {
      method: "DELETE"
    })

    if (response.status !== 204) {
      errorToast((await response.json()).data.message)
      return
    }

    await getAndUpdateUsersList()
  } catch {
    errorToast("Trying to delete the user")
  }
}

const favoriteUser = async (username: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${username}/toggle-star`, {
      method: "PATCH"
    })

    if (response.status !== 200) {
      errorToast((await response.json()).data.message)
      return
    }

    await getAndUpdateUsersList()
  } catch {
    errorToast("Trying to favorite the user")
  }
}

const searchUserAndCreate = async () => {
  if (!username.value.trim()) {
    errorToast("Username is required")
    return
  }

  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value
      })
    })

    if (response.status !== 201) {
      errorToast((await response.json()).data.message)
      return
    }

    await getAndUpdateUsersList()

    toast({
      title: "Success",
      description: "User created successfully",
      duration: 3000,
      variant: "info"
    })
  } catch {
    errorToast("Trying to create a new user")
  } finally {
    username.value = ''
  }
}

watch(sorted, () => checkAndSortUsers(users.value))

onBeforeMount(getAndUpdateUsersList)
</script>

<template>
  <Toaster />
  <header class="flex items-center justify-center m-5">
    <div class="flex-col items-center justify-center w-full">
      <div class="grid gap-y-2 items-center justify-center mb-3">
        <h1 class="font-semibold text-2xl text-center font-sans">GitHub Stars</h1>
        <div class="relative w-full max-w-sm items-center">
          <Input v-model="username" @keyup.enter="searchUserAndCreate" id="username" type="text" placeholder="Username..." class="pr-10" />
          <span class="absolute end-0 inset-y-0 flex items-center justify-center px-2">
            <Plus class="size-6 text-muted-foreground hover:cursor-pointer" @click="searchUserAndCreate" />
          </span>
        </div>
      </div>
      <div class="flex items-center justify-end space-x-2">
        <Checkbox id="sorted" v-model:checked="sorted" />
        <label
          for="sorted"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Sort by name
        </label>
      </div>
    </div>
  </header>
  <main>
    <div v-if="users.length === 0" class="flex items-center justify-center">
      <p>No users found. Please add some users!</p>
    </div>
    <div v-else class="flex items-center justify-center gap-8 flex-wrap mb-8">
      <Card v-for="user in users" :key="user.id">
        <CardHeader>
          <CardTitle>{{ user.name ?? user.username }}</CardTitle>
          <CardDescription>{{ user.username }}</CardDescription>
        </CardHeader>
        <CardContent>
          <img draggable="false" class="m-auto rounded-sm" height="250px" width="250px" :src="user.photo_url" :alt="`${user.username} profile picture`">
        </CardContent>
        <CardFooter class="flex items-center justify-center gap-10 mx-8">
          <a :href="`https://github.com/${user.username}`" target="__blank">
            <Github class="size-7 text-muted-foreground hover:cursor-pointer hover:text-ring transition-all delay-75" />
          </a>
          <Trash2 class="size-7 text-muted-foreground hover:cursor-pointer hover:text-rose-700 transition-all delay-75" @click="async () => await deleteUser(user.username)" />
          <Star :fill="user.favorite ? 'yellow' : 'none'" :class="user.favorite ? 'text-yellow-300' : ''" class="size-7  text-muted-foreground hover:cursor-pointer hover:text-yellow-400 transition-all delay-75" @click="async () => await favoriteUser(user.username)" />
        </CardFooter>
      </Card>
    </div>
  </main>
</template>
