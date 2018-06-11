# Evidence Gap Map Visualization

This repository hosts MIT Governance Lab (GOV/LAB)'s evidence gap-map interactive viz for government accountability literature. The viz is hosted at the GOV/LAB website [here](http://www.mitgovlab.org/evidence-gap-map).

If you are a developer working on this visualization app, perform the following steps:

1. Gain write access to this repo by getting added as a collaborator. 

2. Perform a `git clone` on this repository either by running the command `git clone [name-of-this-repo].git` or by hitting the green clone/download button on the upper right.

3. Use your terminal command-line to navigate to the cloned repo directory (`cd [/local/path/to/cloned/repo`).

4. Locally serve the visualization app on a Python webserver (recommended) via the command `python -m SimpleHTTPServer 8000`. You can now see a local version of the app at the address `localhost:8000`. Any changes you make to the static HTML and javascripts will be reflected in this app.

5. Once you are satisfied with the changes, prepare the files you've changed for git (`git add [/path/to/modified/file]`), commit them (`git commit -m 'message about this modification`), and then push to master (`git push origin master`).

6. The pushed changes can be see online at https://mit-govlab.github.io/Evidence-Gap-Map/. 
