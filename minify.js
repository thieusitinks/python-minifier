class Minifier {

    constructor(element) {
        this.minifyButton = document.getElementById('minify');
        this.sourceTextArea = document.getElementById('source');
        this.minifiedTextArea = document.getElementById('minified');
        this.sourceSizeSpan = document.getElementById('source-size');
        this.minifiedSizeSpan = document.getElementById('minified-size');
        this.copyButton = document.getElementById('copy');

        this.api_url = 'https://api.python-minifier.com/shrink/';

        this.minifyButton.addEventListener('click', this.minifyClick.bind(this));
        this.copyButton.addEventListener('click', this.copyClick.bind(this));
        this.sourceTextArea.addEventListener('input', this.updateSourceSize.bind(this));

        const options = [
            'combine_imports',
            'remove_pass',
            'remove_literal_statements',
            'hoist_literals',
            'rename_locals',
            'rename_globals',
            'preserve_globals',
            'preserve_locals',
            'convert_posargs_to_args',
            'preserve_shebang',
            'remove_asserts',
            'remove_debug',
            'remove_explicit_return_none',
            'remove_builtin_exception_brackets',
            'constant_folding',
            'remove_variable_annotations',
            'remove_return_annotations',
            'remove_argument_annotations',
            'remove_class_attribute_annotations',
            'target_python'
        ];
        for (let option of options) {
            document.getElementById(option).addEventListener('change', this.optionsChange.bind(this));
        }

        this.sourceSizeSpan.innerHTML = this.sourceTextArea.value.length + ' Bytes';
        this.minifyButton.disabled = false;
    }

    build_query() {
        const options = [
            'combine_imports',
            'remove_pass',
            'remove_literal_statements',
            'hoist_literals',
            'rename_locals',
            'rename_globals',
            'convert_posargs_to_args',
            'preserve_shebang',
            'remove_asserts',
            'remove_debug',
            'remove_explicit_return_none',
            'remove_builtin_exception_brackets',
            'constant_folding',
            'remove_variable_annotations',
            'remove_return_annotations',
            'remove_argument_annotations',
            'remove_class_attribute_annotations',
        ];

        let query = options.map(option => `${option}=${document.getElementById(option).checked}`).join('&');

        const preserve_globals = document.getElementById('preserve_globals').value;
        if (preserve_globals) {
            query += '&preserve_globals=' + encodeURIComponent(preserve_globals)
        }

        const preserve_locals = document.getElementById('preserve_locals').value;
        if (preserve_locals) {
            query += '&preserve_locals=' + encodeURIComponent(preserve_locals)
        }

        return query;
    }

    optionsChange(event) {
        this.minifiedTextArea.disabled = true;
    }

    copyClick() {
        navigator.clipboard.writeText(this.minifiedTextArea.value);
    }

    async minifyClick(event) {
        this.minifyButton.disabled = true;
        this.minifiedSizeSpan.innerHTML = 'Working....';

        try {
            const target_python = document.getElementById('target_python').value;
            const response = await fetch(this.api_url + target_python + '?' + this.build_query(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: this.sourceTextArea.value
            });

            if (response.ok) {
                const minified = await response.text();
                 this.minifiedTextArea.value = minified;
                this.minifiedSizeSpan.innerHTML = minified.length + ' Bytes';
                this.minifiedTextArea.disabled = false;
                this.copyButton.disabled = false;
            } else {
                this.copyButton.disabled = true;
                this.minifiedTextArea.value = '';
                this.minifiedSizeSpan.innerHTML = 'Error';

                try {
                    const error = await response.json();
                    this.minifiedSizeSpan.innerHTML = error['message'];
                } catch {

                }
            }
        } catch (error) {
            this.copyButton.disabled = true;
            this.minifiedTextArea.value = '';
            this.minifiedSizeSpan.innerHTML = 'Timeout - Source too complex for this interface! Try downloading the package.';
        }

        this.minifyButton.disabled = false;
    }

    updateSourceSize(event) {
        this.sourceSizeSpan.innerHTML = this.sourceTextArea.value.length + ' Bytes';
        this.minifiedTextArea.disabled = true;
    }

}

const minifier = new Minifier(document);
