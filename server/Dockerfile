# Build stage
FROM golang:1.20-alpine as builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -o main .

# Final stage
FROM alpine:latest

WORKDIR /app

# Install SQLite dependencies
RUN apk add --no-cache sqlite-libs

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Copy the SQLite database file
COPY tobe_shop.db .

# Copy any config files or static assets
COPY config ./config

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"] 