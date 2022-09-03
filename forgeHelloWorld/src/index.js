import api, { route } from "@forge/api";


const buildOutput = (rnd) => ({
  body: '{"hello": "world"}',
  headers: {
    'Content-Type': ['application/json'],
    'X-Request-Id': [`rnd-${rnd}`]
  },
  statusCode: 200,
  statusText: 'OK'
});

exports.runAsync = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = buildOutput(Math.random());
      resolve(result);
    }, 1000);
  });
};

exports.runSync = () => {
  const result = buildOutput(Math.random());
  return result;
};

//this runs on page view
export async function run(event, context) {
	console.log(event);

  const response = await addComment("PILOT-1", "Hello World! It's the Comment Issue app." + JSON.stringify(event) + JSON.stringify(context));

    console.log(`Response: ${JSON.stringify(response)}`);

}


async function addComment(issueId, message) {
    /**
     * @issueId - the Jira issueId number for the issue that this function will try to add
     * a comment to (as per the Jira Rest API)
     * @message {string} - the message that will appear in the comment
     *
     * @example addComment('10050', 'f5ce5f0a-3ab7-404a-b96b-96ebbd79102f', 'Hello world')
     */

    // See https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-issue-issueIdOrKey-comment-post
    const requestUrl = route`/rest/api/3/issue/${issueId}/comment`;
    const body = {
        "body": {
            "type": "doc",
            "version": 1,
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "text": message,
                            "type": "text"
                        }
                    ]
                }
            ]
        }
    };

    // Use the Forge Runtime API to fetch data from an HTTP server using your (the app developer) Authorization header
    let response = await api.asApp().requestJira(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    // Error checking: the Jira issue comment Rest API returns a 201 if the request is successful
    if (response.status !== 201) {
        console.log(response.status);
        throw `Unable to add comment to issueId ${issueId} Status: ${response.status}.`;
    }

    return response.json();
}