# Grails Setup

* Download Groovy and Grails Tool Suite: http://www.springsource.org/downloads/sts-ggts
* Set JAVA_HOME and GRAILS_HOME per http://grails.org/doc/latest/guide/gettingStarted.html#requirements

```bash
export JAVA_HOME=/Library/Java/Home
export PATH="$PATH:$JAVA_HOME/bin"
export GRAILS_HOME=/Applications/springsource/grails-2.2.3
export PATH="$PATH:$GRAILS_HOME/bin"
```

* Assuming you are in the "CheesecakeToConsumers" directory, you can then run:

```bash
grails run-app -https
```

You can then hit the site at https://localhost:8080/CheesecakeToConsumers or https://localhost:8443/CheesecakeToConsumers .

For HTTPS you'll get some security exceptions because of a self-signed certificate.  It is ok to accept these/ignore the warnings.

# Markdown Info

* http://www.winterwell.com/software/markdown-editor.php
* http://marketplace.eclipse.org/content/github-flavored-markdown-viewer-plugin-update-site
* https://help.github.com/articles/github-flavored-markdown