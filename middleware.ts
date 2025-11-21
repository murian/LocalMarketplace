export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/items/new',
    '/items/:id/edit',
    '/messages/:path*',
    '/profile/:path*',
  ],
}
