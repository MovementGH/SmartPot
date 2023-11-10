# Running the SmartPot Website

To run the SmartPot Website, you must first enter a OneSignal app id and key into:
- docker-compose.yml
- Client/src/Config.json
Otherwise notifications will not work.

## Production

To run the production build of the SmartPot Website, use the following commands:

```bash
cd Server
docker-compose build
docker-compose up
```

## Debug

To run the debug build of the SmartPot Website (so that changes to the client-side appear in real time), use the following commands:

```bash
cd Server
docker-compose build
docker-compose up -d
cd ../Client
npm run debug
```