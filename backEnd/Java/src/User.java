import java.util.UUID;

public class User{
    private String id;
    private String nome;
    private String email;
    private String type;

    public User(String nome, String email, String type){
        this.nome = nome;
        this.email = email;
        this.type = type;
        this.id = UUID.randomUUID().toString();
    }

    public String getEmail() {
        return email;
    }
         public void setEmail(String email) {
            this.email = email;
        }
    
    public String getNome() {
        return nome;
    }
         public void setNome(String nome) {
             this.nome = nome;
         }

    public String getType() {
        return type;
    }
         public void setType(String type) {
            this.type = type;
        }

        public String toJson(){
            return String.format(
               "{\"id\":\"%s\", \"nome\":\"%s\", \"email\":\"%s\", \"type\":\"%s\"}",
               this.id, this.nome, this.email, this.type
            );
        }

}