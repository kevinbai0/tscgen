mkdir -p docs/input
cp -R packages/tscgen/dist/docs/*.api.json docs/input
cp -R packages/framework/dist/docs/*.api.json docs/input
cd docs/
api-documenter markdown
