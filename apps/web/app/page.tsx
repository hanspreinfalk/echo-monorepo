'use client'

import { Authenticated, Unauthenticated, useQuery } from "convex/react"
import { UserButton, SignInButton } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"
import { api } from "@workspace/backend/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getMany);
  return (
    <>
      <Authenticated>
        <div className="flex min-h-svh p-6">
          <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
            <div>
              <h1 className="font-medium">App web!</h1>
              <UserButton />
              <p>You may now add components and start building.</p>
              <p>We&apos;ve already added the button component for you.</p>
              <Button className="mt-2">Button</Button>
            </div>
            <div className="text-muted-foreground font-mono text-xs">
              (Press <kbd>d</kbd> to toggle dark mode)
            </div>
            <pre>{JSON.stringify(users, null, 2)}</pre>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <p>Must be signed in!</p>
        <SignInButton>Sign in</SignInButton>
      </Unauthenticated>
    </>
  )
}
