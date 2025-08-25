# TUMex Admin Dashboard

Un dashboard administrativo moderno para la gestión de órdenes médicas y equipos quirúrgicos.

## Configuración Inicial

### Variables de Entorno

Para que la aplicación funcione correctamente, necesitas configurar las siguientes variables de entorno:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:

```bash
# Variables de entorno para Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Configuración del servidor de desarrollo
VITE_API_URL=http://localhost:8080
```

### Configuración de Supabase

1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto
2. En la configuración del proyecto, encuentra las credenciales de la API
3. Copia la URL del proyecto y la clave anónima
4. Actualiza las variables de entorno con estos valores

### Solución de Problemas

Si encuentras errores como:
- "Failed to load resource: the server responded with a status of 400"
- "Error fetching available products"

Verifica que:
1. Las variables de entorno estén configuradas correctamente
2. La URL de Supabase sea válida
3. La clave anónima sea correcta
4. La base de datos tenga las tablas necesarias

## Project info

**URL**: https://lovable.dev/projects/08bea2a8-f102-44e5-9637-cbd8911b8643

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/08bea2a8-f102-44e5-9637-cbd8911b8643) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/08bea2a8-f102-44e5-9637-cbd8911b8643) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
