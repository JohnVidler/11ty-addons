const EleventyFetch = require('@11ty/eleventy-fetch');
const { Octokit } = require('octokit');

function getToken( token ) {
  const fs = require( 'fs' );
  const os = require( 'os' );
  const path = require( 'path' );

  if( process.env.USER_GITHUB_TOKEN )
    return process.env.USER_GITHUB_TOKEN;

  if( process.env.GITHUB_TOKEN )
    return process.env.GITHUB_TOKEN;

  let tokenFile = path.join( os.homedir(), ".auth", `${token}.tok` );
  if( fs.existsSync(tokenFile) )
    return fs.readFileSync( tokenFile ).toString('utf8');

  throw "Failed to find a Github token!";
}

const FETCH_OPTS = { duration: '7d', type: 'json', directory: '.cache' };

async function getBadges( octokit, owner, repo ) {
  console.log( `Pulling badges for ${owner}/${repo} ...` );
  let workflowRuns = await octokit.request(
    `GET /repos/{owner}/{repo}/actions/runs`,
    {
      'owner': owner,
      'repo': repo,
      headers: { 'X-GitHub-Api-Version': '2022-11-28' }
    }
  );

  let badges = [];
  for( let spec of workflowRuns.data.workflow_runs ) {
    let flowData = await EleventyFetch( spec.workflow_url, FETCH_OPTS );
    if( flowData )
      badges.push( flowData.badge_url );
  }
  return badges.filter( (v,i,a) => a.indexOf(v) == i ).filter( v => v.indexOf("pages") == -1 );
}

async function update_github_data( ExtraRepos = [] ) {

  try {
    const octokit = new Octokit({
      auth: getToken("github")
    });

    let packages = [];
    
    let dockerImages = await octokit.request(
      'GET /user/packages',
      {
        headers: { 'X-GitHub-Api-Version': '2022-11-28' },
        package_type: "container",
        visibility: "public",
      }
    );
    packages.push( ...dockerImages.data );
    console.log( `Found ${dockerImages.data.length} docker images...` );

    let npmPackages = await octokit.request(
      'GET /user/packages',
      {
        headers: { 'X-GitHub-Api-Version': '2022-11-28' },
        package_type: "npm",
        visibility: "public",
      }
    );
    packages.push( ...npmPackages.data );
    console.log( `Found ${npmPackages.data.length} npm packages...` );

    // Add icons where appropriate...
    packages.forEach( pkg => {
      pkg.updated_at = new Date(pkg.updated_at).toLocaleString();
      switch( pkg.package_type ) {
        case "container": pkg.icon = "/assets/images/icons8/icons8-docker-50.png"; break;
        case "npm":       pkg.icon = "/assets/images/icons8/icons8-npm-32.png"; break;
        default:          pkg.icon = "/assets/images/icons8/icons8-package-24.png";
      }
    } );

    // Grab a list of repos and their attributes...
    let list = [];

    // MEMBER permission repos
    //let userRepos = await octokit.paginate( 'GET /user/repos?type=member', { headers: { 'X-GitHub-Api-Version': '2022-11-28' } } );
    //list.push( ...userRepos );

    // PUBLIC permission repos
    //let publicRepos = await octokit.paginate( 'GET /user/repos?type=public', { headers: { 'X-GitHub-Api-Version': '2022-11-28' } } );
    //list.push( ...publicRepos );

    // OWNER permission repos
    let ownerRepos = await octokit.paginate( 'GET /user/repos?type=owner', { headers: { 'X-GitHub-Api-Version': '2022-11-28' } } );
    list.push( ...ownerRepos );

    list.forEach( repo => {
      console.log( `\t- ${repo.name}` );
    } );

    // Don't show any forks of other repos...
    list = list.filter( v => !v.fork );
    console.log( `Filtered to ${list.length} repos...` );

    for( let i=0; i<ExtraRepos.length; i++ ) {
      try {
        let extraRepo = await octokit.request( `GET /repos/${ExtraRepos[i]}`, { headers: { 'X-GitHub-Api-Version': '2022-11-28' } } );
        list.push( extraRepo.data );
      } catch ( err ) {
        console.warn( `Unable to get data for "${ExtraRepos[i]}"` );
        console.warn( err );
      }
    }

    // Hide any duplicate or private repos...
    list = list.filter( f => !f.private ).filter( (v,i,a) => a.indexOf(v) == i );
    console.log( `Removed private/duplicate repos, to ${list.length} repos...` );

    console.log( `Found ${list.length} github repos...` );

    // Grab any badges for the repo list
    for( let spec of list )
      spec.workflow_badge_urls = await getBadges( octokit, spec.owner.login, spec.name ) || [];

    return {
      repos: list.filter( v => !v.archived ).sort( (a,b) => a.name.localeCompare(b.name) ),
      archived_repos: list.filter( v => v.archived ).sort( (a,b) => a.name.localeCompare(b.name) ),
      packages: packages.sort( (a,b) => a.name.localeCompare(b.name) )
    };
  }
  catch( err ) {
    console.error( "Failed to fully request data from github... pages will be incomplete" );
    console.log( err );
  }

  return {
    repos: [],
    packages: []
  };
};

let github_cache = null;
module.exports = async function (eleventyConfig, pluginOptions) {

  let gitExtras = pluginOptions.extra || [];

	if( github_cache == null )
    github_cache = await update_github_data( gitExtras );

  return github_cache;
};