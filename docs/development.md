# NexTrade Development Guide

This document outlines the development workflow and useful commands for working on the NexTrade project.

## Backend (Node.js/Express/TypeScript)

### Commands

- `npm run dev` - Start the development server with auto-reload (ts-node-dev)
- `npm run build` - Compile TypeScript to JavaScript (output to `dist/` directory)
- `npm start` - Start the production server (compiled JavaScript)
- `npm test` - Run tests (currently a placeholder)

### Development Workflow

1. Make changes to TypeScript files in `src/`
2. The development server (`npm run dev`) will automatically restart on file changes
3. To test production build locally:
   ```bash
   npm run build
   npm start
   ```

### Code Style

- Follow the existing code style in the project.
- Consider using ESLint and Prettier (to be added in later weeks).

## Frontend (React/TypeScript/Tailwind)

### Commands

- `npm run dev` - Start the Vite development server
- `npm run build` - Build for production (output to `dist/` directory)
- `npm run preview` - Preview the production build locally

### Development Workflow

1. Make changes to files in `src/`
2. The development server will automatically reload on file changes (via Vite HMR)
3. To test production build:
   ```bash
   npm run build
   npm run preview
   ```

### Styling

- Styling is done with Tailwind CSS. Modify `tailwind.config.js` for theme customization.
- Use utility classes in JSX/TSX components.

## Mobile (Flutter/Dart)

### Commands

- `flutter pub get` - Fetch dependencies
- `flutter run` - Run the app on an emulator or device
- `flutter build apk` - Build an Android APK
- `flutter build ios` - Build an iOS IPA (requires macOS and Xcode)

### Development Workflow

1. Ensure you have an emulator running (e.g., `emulator -avd <avd_name>`) or a device connected (`flutter devices`)
2. Run `flutter run` to start the app in debug mode with hot reload
3. Press `r` in the terminal to hot reload, or `R` for hot restart
4. Edit Dart files; changes will be reflected quickly

## AI Service (Python/Flask)

### Commands

- `python run.py` - Start the Flask development server
- For production, consider using a WSGI server like Gunicorn:
  ```bash
  gunicorn --bind 0.0.0.0:5000 run:app
  ```

### Development Workflow

1. Make changes to Python files
2. Restart the server to see changes (or use a reload mechanism like `flask --debug`)
3. To test endpoints, use `curl` or a tool like Postman:
   ```bash
   curl http://localhost:5000/health
   ```

### Dependencies

- Add new Python packages to `requirements.txt` and run `pip install -r requirements.txt`

## Database

### Commands (using psql)

- Connect to the database:
  ```bash
  psql -h localhost -U nextrade -d nextrade
  ```
- Run SQL scripts from the `database/scripts/` directory
- Migrations (to be implemented) will be run via a migration tool

### Development Tips

- Keep SQL scripts in `database/scripts/` for reproducibility
- Use `database/seeds/` for initial data
- Always backup your development database before running destructive operations

## Cross-Service Communication

During development, services communicate via localhost:

- Frontend → Backend: `http://localhost:3000` (or as set in `VITE_API_BASE_URL`)
- Frontend → AI: Not directly; frontend communicates AI-related requests via backend
- Backend → AI: `http://localhost:5000` (or as set in `AI_SERVICE_URL` environment variable)
- Backend → Database: PostgreSQL on `localhost:5432` (or as set in DB_* environment variables)

## Environment Variables

Each service has its own `.env` file (based on `.env.example`). Common variables:

- `PORT`: Port the service runs on
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection
- `API_BASE_URL`: Base URL of the backend (used by frontend and AI service)
- `AI_SERVICE_URL`: Base URL of the AI service (used by backend)

Never commit actual `.env` files; only `.env.example` is version-controlled.

## Debugging

### Backend

- Use `console.log` statements or a debugger (e.g., VS Code debugger)
- Check logs in the terminal where `npm run dev` is running

### Frontend

- Use browser developer tools (Chrome DevTools, Firefox DevTools)
- Use React DevTools extension for component inspection

### Mobile

- Use Flutter DevTools (`flutter pub global activate devtools`)
- Use IDE debugging (Android Studio, VS Code with Flutter extension)

### AI Service

- Use Flask debugger or print statements
- Check logs in the terminal where `python run.py` is running

## Testing

Testing frameworks will be added in later weeks. For now:

- Backend: Placeholder tests in `backend/tests/`
- Frontend: Placeholder tests in `frontend/tests/` (to be created)
- Mobile: Unit and widget tests in `mobile/test/`
- AI Service: Tests in `ai/tests/`

To run tests (when implemented):

- Backend: `npm test`
- Frontend: `npm test` (if using Jest/Vitest)
- Mobile: `flutter test`
- AI Service: `python -m pytest`

## Code Organization

Each service follows a similar modular structure:

- `src/` or `lib/` - Source code
- `components/` - UI components (frontend/mobile)
- `services/` - Business logic and API communication
- `models/` - Data models and types
- `utils/` - Helper functions
- `routes/` or `controllers/` - Request handlers (backend)
- `middleware/` - Custom middleware (backend)

## Version Control

- Commit often with descriptive messages
- Use feature branches for new features or bug fixes
- Pull requests are required for merging into main branch
- Follow the commit message convention: `<type>: <description>` (e.g., `feat: add user login`)

## Getting Help

If you encounter issues:

1. Check the console/logs for error messages
2. Search the project documentation (this file and other .md files)
3. Ask a team member or consult the relevant technology documentation
4. For environment-specific issues, verify prerequisites are installed correctly

---

**Note**: This guide reflects the Week 1 setup. As the project evolves, additional tools, scripts, and commands will be added.