# PropertyPoint

PropertyPoint is a full-stack real estate marketplace where buyers can browse and inquire about properties, sellers can list and manage properties, and administrators can approve sellers, monitor listings, and manage user inquiries.

The app combines a React + Vite frontend with a Node.js + Express + MongoDB backend, plus real-time chat using Socket.IO and email features for verification and password resets.

## Project overview

### Core features
- Buyer registration and login
- Seller registration and approval flow
- Email verification for new users
- Password reset via email
- Property listing management for sellers
- Property search and details pages for buyers
- Wishlist management
- Inquiry submission for properties
- Chat between buyers and sellers
- Contact form for support/contact requests
- Admin dashboard for users, contacts, listings, and seller requests
- Cloudinary image upload for property photos

### User roles
- Buyer
- Seller
- Admin

### Tech stack
- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Real-time: Socket.IO
- Media upload: Cloudinary
- Email: Brevo API
- Authentication: JWT + bcrypt

## Repository structure

```text
PropertyPoint/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore
```

## Backend

The backend exposes REST APIs under the `/api` route and handles:
- authentication and authorization
- property management
- inquiries and wishlist data
- contact and admin operations
- live chat socket events
- cloud image uploads
- email sending for verification and reset flows

### Backend scripts

```bash
cd backend
npm install
npm run dev
```

Production-style start:

```bash
cd backend
npm start
```

## Frontend

The frontend is a React app served by Vite. It uses the backend API base URL from an environment variable and routes users based on their role.

### Frontend scripts

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
```

## Environment variables

Create a `.env` file in the `backend` folder and a `.env` file in the `frontend` folder.

> Important: do not commit real secrets. Use placeholder values locally and keep production values in your deployment environment.

### Backend `.env` variables

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/PropertyPoint?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_string
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Brevo / email service
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your_verified_sender_email@example.com

# Optional compatibility alias if you still use it somewhere in the codebase
CLIENT_URL=http://localhost:5173
```

#### Variable descriptions
- `PORT`: Port used by the Express server, default `5000`
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key used to sign JWT tokens
- `FRONTEND_URL`: Allowed frontend origin for CORS and app links
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary secret
- `BREVO_API_KEY`: Brevo API key for sending email
- `EMAIL_USER`: Verified sender email used by Brevo
- `CLIENT_URL`: Optional compatibility variable; some older code paths may still reference this

### Frontend `.env` variables

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

#### Variable description
- `VITE_API_URL`: Base URL for the backend API. The app builds requests like `${VITE_API_URL}/api/...`.

## Example startup flow

1. Start MongoDB
2. Create backend `.env` values
3. Create frontend `.env` value
4. Install dependencies in both folders
5. Run backend with `npm run dev`
6. Run frontend with `npm run dev`
7. Open the frontend URL (usually `http://localhost:5173`)

## Notes

- The backend uses CORS with the frontend URL in `server.js`.
- Property images are uploaded to Cloudinary.
- Email verification and password reset use Brevo.
- The app expects a MongoDB database to be available before the backend can start successfully.

## Suggested future improvements
- Add pagination and filtering for property search
- Add admin audit logs
- Improve property image gallery and multiple-photo upload handling
- Add unit and integration tests
- Add Docker support

## License

This project is intended for local development and educational/demo use unless otherwise specified by the project owner.
