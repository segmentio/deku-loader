
lib: lib/index.js lib/index.css

lib/index.js: src/index.js node_modules
	mkdir -p $(dir $@)
	./node_modules/.bin/babel src/index.js --source-maps inline > $@

lib/index.css: src/index.css src/spinner.svg node_modules
	mkdir -p $(dir $@)
	./node_modules/.bin/postcss --use autoprefixer --use postcss-image-inliner src/index.css > $@

build: build/bundle.js build/index.html build/bundle.css

build/bundle.js: src/index.js example/index.js node_modules
	mkdir -p $(dir $@)
	./node_modules/.bin/browserify --debug --transform babelify example/index.js > build/bundle.js

build/index.html: example/index.html
	mkdir -p $(dir $@)
	cp $< $@

build/bundle.css: lib/index.css
	mkdir -p $(dir $@)
	cp $< $@

node_modules: package.json
	npm install
	touch $@

clean:
	rm -rf lib build

distclean: clean
	rm -rf node_modules

gh-pages: build
	./node_modules/.bin/gh-pages --dist $<

.PHONY: clean distclean build gh-pages
