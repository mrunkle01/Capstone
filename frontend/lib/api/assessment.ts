export async function assessImage(formData: FormData){
    const section_id = 0 //made this hard coded for the demo
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/assess/${section_id}`
    const response = await fetch(url, {
        method: "POST",
        body: formData,
    })
   return response.json();
}
export async function printConcepts(){
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/concepts/`;
    const response = await fetch(url, {
        method: "GET"
    })
   return response.json();
}

