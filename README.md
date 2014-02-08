# sails

## Objective



## Usage
	
	Before redeploy:

		1. Excange to root user:
		
			sudo su

		2. Remove sails-log.txt: 

			rm /root/.forever/sails-log.txt	

		3. Remove sails-error.txt:
			
			rm /home/bitnami/sails/sails-error.txt
			
		4. Remove sails-out.txt:

			rm /home/bitnami/sails/sails-out.txt
		
		5.  Git pull source code:

			git pull
			
		6. Kill running process:

			6.1 Show running process:
			
				 ps aux | grep  node
		
			6.2 Kill the two process:
			
				kill -9 ${PID1}
				kill -9 ${PID2}

		7. Reexecute node app.js:
		
			forever start -l sails-log.txt -o sails-out.txt -e sails-error.txt app.js

## Developing


Created with [Nodeclipse v0.4](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   
