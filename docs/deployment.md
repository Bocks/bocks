# Deployment

## Digital Ocean Run Setup

### Create a Digital Ocean Droplet

Create a Digital Ocean Droplet using the `MEAN on 14.04` one-click app.

### Set up a user with access

Log onto droplet.

	ssh root@droplet-ip-address

(Droplet) Create `/home/deploy/bocks` directory.

	adduser deploy
	su - deploy
	mkdir bocks

### Pull down/setup repo

	git clone https://github.com/bocks/bocks.git
	cd bocks
	npm install

### Setup Server Env and Port Forwarding

As root, `nano /etc/environment` and add the following lines to the file:

	export BOCKS_CLIENT_ID="<GITHUB_CLIENT_ID>"
	export BOCKS_CLIENT_SECRET="<GITHUB_CLIENT_SECRET>"
	export BOCKS_SESSION_SECRET="<EXPRESS_SESSION_SECRET>"
	export PORT=3000
	export NODE_ENV=production

As root, add port forwarding from `80` to `3000`

	sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

As root, add the following to your `/etc/rc.local` file so that the above iptables rule sticks around after a reboot. Add this before the `exit 0` line.

	iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

### Run the App

As root

	`npm install -g forever`

As `deploy` (user), start up the express app server with

	forever start --watch server/server.js

See [Process Managers for Express Apps](http://expressjs.com/en/advanced/pm.html#forever) for more details on using Forever.

As `deploy` (user), run `crontab -e` and add the following to your cron so that forever will start up the app on reboot.

	@reboot /usr/bin/forever start --watch /home/deploy/bocks/server/server.js

## Digital Ocean Update Live Server

	ssh root@droplet-ip-address
	su - deploy
	cd bocks
	git pull origin master
	npm install # if needed
	forever restartall # if not using --watch above

---

TODO This section is not complete.

## How To Deploy (Advanced Optional)

* `git pull remote production`
* `git push remote production`

## Deployment Setup (Advanced Optional)

For setting up automatic deployment is setup to trigger on commits to the `production` branch of `bocks/bocks`.

### Create a Digital Ocean Droplet

Create a Digital Ocean Droplet using the `MEAN on 14.04` one-click app.

### Set up a user with access

Log onto droplet.

	ssh root@droplet-ip-address

(Droplet) Create `/var/www` directory.

	adduser deploy
	chown -R deploy:deploy /var/www

(Local) Create an ssh key for Travis to log in with. When asked, provide the output filename of `deploy-key`.

	ssh-keygen

(Droplet) Login with `deploy` user

	su - deploy

(Droplet) Create and `authorized_keys` file:

	mkdir ssh
	chmod 700 .ssh
	nano .ssh/authorized_keys

(Local / Droplet) Copy the contents of `deploy_key` that was created earlier into the `authorized_keys` file that is on the server.

(Droplet) Restrict permissions on `authorized_keys` file.

	chmod 600 .ssh/authorized_keys

### Create Remote (Repo) on Droplet

(Droplet) Create a bare repo

	mkdir bocks.git
	cd bocks.git
	git init --bare

(Droplet) Add post-receive hook to repo so commits will copy to the live directory.

	cd hooks
	nano post-receive

Then add the following to the `post-receive` file:

	#!/bin/sh
	git --work-tree=/home/deploy/bocks/ --git-dir=/home/deploy/bocks.git checkout -f

Save the file and exit the editor, then set permissions on the file so that it can be executed.

	chmod +x post-receive

### Set up Travis CI

(Local) Create a `.travis.yml` file in your project root.

	touch .travis.yml

(Local) Encrypt a copy of the deploy key

	gem install travis
	# or sudo gem install travis -n/usr/local/bin
	travis login
	travis encrypt-file deploy-key --add

(Local) Now delete the unencrypted deploy-key

	rm deploy-key

---

**TODO Finish Deployment**

---
