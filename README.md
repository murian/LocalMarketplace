# Local Marketplace

A geolocation-based online marketplace where users can buy, sell, and donate items within 500 meters of their location. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Geolocation-based Discovery**: Find items within 500m of your location
- **User Authentication**: Secure signup and login system
- **Item Listings**: Create, edit, and delete item listings with photos
- **Advanced Search & Filters**: Search by keyword, category, price, and distance
- **Private Messaging**: Direct messaging between buyers and sellers
- **User Profiles**: View user profiles with ratings and reviews
- **Review System**: Rate and review other users
- **Real-time Location**: Uses browser geolocation API for accurate positioning
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- A modern web browser with geolocation support

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd LocalMarketplace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/local_marketplace?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication and location data
- **Item**: Product listings with geolocation, images, and metadata
- **Message**: Private messages between users
- **Review**: User ratings and reviews

## Deployment to Vercel

### 1. Database Setup

First, set up a PostgreSQL database. You have two options:

#### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Create a new Postgres database
4. Vercel will automatically set the `DATABASE_URL` environment variable

#### Option B: External PostgreSQL Provider

Use services like:
- [Supabase](https://supabase.com/) (free tier available)
- [Neon](https://neon.tech/) (free tier available)
- [Railway](https://railway.app/)
- [Heroku Postgres](https://www.heroku.com/postgres)

### 2. Environment Variables

In your Vercel project settings, add the following environment variables:

```
DATABASE_URL=<your-postgres-connection-string>
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=<your-vercel-app-url>  # e.g., https://your-app.vercel.app
```

### 3. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 4. Run Database Migrations

After deployment, run migrations on your production database:

```bash
# Using Vercel CLI
vercel env pull .env.production
DATABASE_URL=<production-database-url> npx prisma migrate deploy
```

## Usage

### For Users

1. **Sign Up**: Create an account with email and password
2. **Enable Location**: Allow browser to access your location
3. **Browse Items**: See items within 500m of your location
4. **Filter & Search**: Use filters to find specific items
5. **Contact Sellers**: Send private messages to item owners
6. **List Items**: Create your own listings with photos
7. **Leave Reviews**: Rate and review other users after transactions

### For Developers

Key directories:
- `/app`: Next.js app router pages and API routes
- `/components`: Reusable React components
- `/lib`: Utility functions (auth, database, geolocation)
- `/prisma`: Database schema and migrations
- `/types`: TypeScript type definitions

Important files:
- `app/api/items/route.ts`: Item CRUD operations and geolocation filtering
- `lib/geolocation.ts`: Distance calculation and filtering logic
- `prisma/schema.prisma`: Database schema definition

## Key Features Implementation

### Geolocation Filtering

The app uses the Haversine formula to calculate distances between coordinates:

1. User's browser provides current location
2. Server queries items within a bounding box (for efficiency)
3. Precise distance calculation filters items within 500m
4. Results are sorted by distance

### Security

- Passwords are hashed using bcrypt
- Authentication via NextAuth.js with JWT sessions
- API routes protected with middleware
- SQL injection prevention via Prisma ORM

### Image Handling

Currently uses image URLs. For production, consider integrating:
- Cloudinary
- AWS S3
- Vercel Blob Storage
- Uploadthing

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in (via NextAuth)

### Items
- `GET /api/items` - Get items near location (with filters)
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get single item
- `PATCH /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Messages
- `GET /api/messages` - Get conversations or messages with user
- `POST /api/messages` - Send message

### Users
- `GET /api/users/[id]` - Get user profile with reviews

### Reviews
- `POST /api/reviews` - Create or update review

## Troubleshooting

### Location not working
- Ensure HTTPS in production (required for geolocation API)
- Check browser permissions for location access
- Use a device with GPS capability for better accuracy

### Database connection issues
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from your deployment
- Check firewall rules for database access

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to generate Prisma client
- Check for TypeScript errors with `npm run lint`

## Future Enhancements

- Image upload functionality (currently uses URLs)
- Map view for items
- Real-time messaging with WebSockets
- Push notifications
- Email verification
- Social authentication (Google, Facebook)
- Item categories with icons
- Favorites/bookmarks
- Transaction history
- Admin dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.
