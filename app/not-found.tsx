import NotFoundClient from "./not-found-client"

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return <NotFoundClient />
}
