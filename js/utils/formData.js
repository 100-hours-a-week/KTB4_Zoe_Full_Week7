/** 집어넣을 객체를 파라미터로 넘기면 formdata에 객체를 넣어주는 함수*/ 

export function createFormData(data) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if(value == null) return;

        formData.append(key, value);
    });

    return formData;

}