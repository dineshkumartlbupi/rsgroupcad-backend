# RS Solar CAD Group - Backend API

Email service backend for career application submissions.

## Quick Start

1. **Configure SMTP Settings**
   ```bash
   cp .env.example .env
   # Edit .env with your SMTP credentials
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
```
GET /api/health
```

### Submit Career Application
```
POST /api/career/apply
Content-Type: multipart/form-data

Fields:
- fullName
- email
- phone
- currentLocation
- experience
- currentCompany
- noticePeriod
- expectedSalary
- linkedinProfile
- portfolioLink
- coverLetter
- position
- department
- resume (file)
```

## Environment Variables

See `.env.example` for required configuration.

## Documentation

See `../CUSTOM_SMTP_SETUP.md` for detailed setup instructions.
# rsgroupcad-backend
