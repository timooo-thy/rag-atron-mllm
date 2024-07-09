# Use an official Bun runtime as the base image
FROM oven/bun:latest as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lockb* ./

# Install dependencies
# This layer will be cached unless package.json or bun.lockb changes
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN bun run build

# Production image
FROM oven/bun:1-slim as runner

WORKDIR /app

# Copy the standalone output and static files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port the app runs on
EXPOSE 3000

# Set the PORT and HOSTNAME environment variable
# ENV PORT=3069
# ENV HOSTNAME=0.0.0.0

# Start the application
CMD ["bun", "run", "server.js"]