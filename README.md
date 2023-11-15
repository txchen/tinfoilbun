# tinfoilbun
tinfoil server on bun

## How to use

Set environment variables:
- TFLB_AUTH = username:password   # this is for basic auth, if you don't want it, leave it blank
- DELAY_SCAN = 5000  # delay scanning during startup, you might need it when you use rclone mount

Then mount the game folder to `/usr/src/app/static`, and run the container.

### Docker compose example

```yaml
version: "3.3"
services:
  tinfoilbun:
    image: ghcr.io/txchen/tinfoilbun:0.1.0
    container_name: tinfoilbun
    restart: unless-stopped
    volumes:
       - /opt/NSGAME:/usr/src/app/static
    environment:
       - TFLB_AUTH=abc:123
       - DELAY_SCAN=2000
```