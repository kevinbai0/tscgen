mkdir -p docs/input
cp -R packages/tscgen/dist/docs/*.api.json docs/input
cd docs/
api-documenter markdown
