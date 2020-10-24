# Twitter Prom Queen 👸
Let's try to become twitter's prom queen 👸

## what's the plan ?

So the objective is to gain visibility while maintaining quality.

Explicit constraints :
- 4k follows max, unless you reach this number of followers before. 
- 400 follows max per day

Implicit constraints :
- We must be interested in the people we follow. 
- We must be interesting for the people who follow us.
- The level of engagement of the followers must remain the same as at the beginning of the operation. 
- Our level of engagement with the people we follow must not drop.

## two tools

### twitter-lite

For the analysis we will directly use the twitter API via twitter-lite.
> It will allow us to follow our list of followers and to identify new people to follow based on our mutual interests. 

### puppeteer

For user actions we will rather rely on puppeteer in order to get a bit closer to a user's behavior.
> Cookies will be injected for the connection using those of our current browser in order to maintain the same session.
