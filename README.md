# Grails Setup

* Download Groovy and Grails Tool Suite: https://sagan-production.cfapps.io/tools/ggts/
* Set JAVA_HOME and GRAILS_HOME per http://grails.org/doc/latest/guide/gettingStarted.html#requirements

```bash
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH="$PATH:$JAVA_HOME/bin"
export GRAILS_HOME=/Applications/springsource/grails-2.2.4
export PATH="$PATH:$GRAILS_HOME/bin"
```

Note: we are using Grails 2.2 at the moment.  We haven't updated to Grails 2.3. 

## Setup for Compass/Sass

* Install Homebrew
```bash
# Per http://brew.sh/
ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"
```
* Install JRuby
```bash
brew install jruby
```

* Install Compass
```bash
jruby -S gem update --system
jruby -S gem install compass
```

# Running the application 

## Command Line
Assuming you are in the "CheesecakeToConsumers" directory, you can then run:

```bash
grails run-app -https
```

You may also want to append:

```bash
-DJDBC_CONNECTION_STRING=VALUE -DJDBC_USERNAME=VALUE -DJDBC_PASSWORD=VALUE -DuseProdDb=true -DMAIL_USERNAME=VALUE -DMAIL_PASSWORD=VALUE
```

You can then hit the site at https://localhost:8080/ or https://localhost:8443/ .

For HTTPS you'll get some security exceptions because of a self-signed certificate.  It is ok to accept these/ignore the warnings.

## Groovy and Grails Tool Suite (GGTS)
Be sure to launch GGTS using the "GGTS" symlink instead of the GGTS.app.  

For example, launch /Applications/springsource/ggts-3.4.0.RELEASE/GGTS not /Applications/springsource/ggts-3.4.0.RELEASE/GGTS.app

If you don't, then jruby won't be on your PATH.

# Deploying to CloudFront

* Follow the *AWS Credentials File Setup* instructions in https://github.com/kenliu/grails-elastic-beanstalk
* Run the following:
```bash
grails war
grails aws-eb-deploy
```

# Debugging

Add ?_debugResources=y to the URL

# SSHing into the EC2 instance

* Find the current running EC2 instance's public DNS
* Ensure you have access to the Dropbox folder with the "EC2KeyPairs"
* You made to do 

```bash
chmod 400 passToDotPem file.
```

* ssh

```bash
ssh ec2-user@ec2-54-211-192-108.compute-1.amazonaws.com -i ~/Dropbox/givecheesecakes.com/EC2KeyPairs/givecheesecakescom2.pem
```

# Markdown Info

* http://www.winterwell.com/software/markdown-editor.php
* http://marketplace.eclipse.org/content/github-flavored-markdown-viewer-plugin-update-site
* https://help.github.com/articles/github-flavored-markdown