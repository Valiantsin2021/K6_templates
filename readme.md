run with the native dashboard and html report:

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_PERIOD=2s K6_WEB_DASHBOARD_OPEN=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run -e SITE_URL="https://www.google.com" test-example.js