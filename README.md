# Fit10

Fit10 is een mobiele webapp voor een 14-weken traject naar 10 km hardlopen en gewichtsverlies.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/fblanker/hello-furgill)

## Functies
- Dagelijks trainingsschema
- 14-weken 10 km hardloopschema
- Ontbijt, lunch, avondeten en snacks plannen
- Geschatte calorieen per dag
- Stappen en water bijhouden
- Gewicht, langste duurloop en 10 km-tijd loggen
- Lokale opslag in de browser
- JSON back-up export/import
- Licht/donker thema
- PWA-basis

## Lokaal starten

```bash
python3 -m http.server 8080
```

Open daarna `http://localhost:8080`.

## Render

De repository bevat `render.yaml` voor deployment als Render Static Site.
De site heeft geen buildstap nodig en publiceert rechtstreeks vanuit de root van de repository.
