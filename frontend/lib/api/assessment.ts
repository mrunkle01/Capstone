
export async function testImage(formData: FormData, assignment: string){
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/imageTest`
    formData.append("assignment", assignment)
    const response = await fetch(url, {
        method: "POST",
        body: formData
    })
   return response.json();
}

