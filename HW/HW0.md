#Homework 0 - Git Commands and Hooks

##Git Basics 

####Level 1 - Introduction to git commits

* `git commit` 
* `git commit`

####Level 2 - Branching in git

* `git branch bugFix`
* `git checkout bugFix`

####Level 3 - Merging in git

* `git checkout -b bugFix`
* `git commit`
* `git checkout master`
* `git commit`
* `git merge bugFix`

####Level 4 - Rebase introduction

* `git checkout -b bugFix`
* `git commit`
* `git checkout master`
* `git commit`
* `git checkout bugFix`
* `git rebase master`

![level](https://cloud.githubusercontent.com/assets/9273776/9706503/0761c356-54b5-11e5-81d9-4420df8c2cd6.png)

##Git Bonus

####Level 1 - Detach yo' HEAD

* `git checkout C4`

####Level 2 - Relative Refs (^)

* `git checkout bugFix^`

####Level 3 - Relative Refs #2 (^)

* `git branch -f master C6`
* `git branch -f bugFix bugFix~3`
* `git checkout HEAD^`

####Level 4 - Reversing changes in git

* `git reset HEAD^`
* `git checkout pushed`
* `git revert HEAD`

![level2](https://cloud.githubusercontent.com/assets/9273776/9706506/1a50b4cc-54b5-11e5-965c-9994dda3cc43.png)
