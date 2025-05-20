from mitmproxy import http

# JavaScript snippet to inject (modifies the page dynamically)
INJECTED_JS = """
<script>
window.onload = async function(){


    async function askChatGPT(userInput) {
    const apiKey = "YOUR_API_KEY_HERE";

        var res = '';

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{role:"system",content:"You will get a question of type: multiple choice questions/ true or false questions / short free answer question. You will have to write the correct answer in the shortest way possible, for example if b) is correct just write b, or if 'false' is correct write just 'false', or if there are multiple correct answers write for example b,c,d. If you are not sure of your answer just write '?'. Keep in mind that there can be multiple choice answers. Keep in mind that you only work with the details that are given to you, don't assume anything.Also keep in mind if you put more answers than needed I get 0 points."}, { role: "user", content: userInput }],
                    max_tokens: 1024
                })
            });

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                res = data.choices[0].message.content;
            } else {
                res = null;//"No response from API.";
            }
        } catch (error) {
            res = null;//"Error: " + error.message;
        }
        return res;
    }

    var results = []
    var forms = document.getElementsByTagName('form')
    for(let i=0;i<forms.length;i++){
        let text = forms[i].innerText;
        text = text.trim();
        if(text.length < 10) continue;
        console.log(text)

        let res = await askChatGPT(text)
        if(res == null){
            continue
        }
        results.push(res)
    }
    console.log('chatgpt',results);

    //let test = await askChatGPT('what is 1+2+3...+100?')
    //results.push(test)
    //alert(JSON.stringify(results))

    var elems = []
    for(let i=0;i<results.length;i++){
        var e = document.createElement("p");
        e.id='result' +i.toString()
        e.textContent = results[i]
        e.style.visibility= "hidden";
        document.body.append(e)
        elems.push(e)
    }


    function toggleHack(){
        for(let i=0;i<elems.length;i+=1){
            if(elems[i].style.visibility == "hidden"){
                elems[i].style.visibility = "visible";
            } else {
                elems[i].style.visibility = "hidden"
            }
        }
    }



    document.addEventListener("keydown", function (event) {
        if (event.key === "\\\\") {
            toggleHack();
         
        
        }
    });


    

}
</script>
"""

class JSInjector:

    def response(self, flow: http.HTTPFlow):
        """Intercepts HTTP responses and injects JavaScript into <html> pages."""
        # Check if response has a text/html content type
        dd = flow.response.text
        if  '<html' in dd and '<body' in dd and '<head' in dd: #"text/html" in flow.response.headers.get("Content-Type", ""):
            html = flow.response.text
            if "</body>" in html:
                try:
                    self.file_id += 1
                except:
                    self.file_id = 0
                # Inject before closing body tag
                open('htmls/file_'+str(self.file_id)+'.html','w').write(html)
                print('intercepted html response',flow.request.url)
                html = html.replace("</body>", INJECTED_JS + "</body>")
                open('htmls/mod_file_'+str(self.file_id)+'.html','w').write(html)
                flow.response.text = html

addons = [JSInjector()]