class ApiResponses{

    static ok(res,message,data=null){
        return res.status(200).json({
            success:true,
            message:message,
            data:data
        })
    }

    static created(res,message,data){
        return res.status(201).json({
            success:true,
            message,
            data
        })
    }

    static noContent(){
        return res.status(204).send();
    }

}

export default ApiResponses;