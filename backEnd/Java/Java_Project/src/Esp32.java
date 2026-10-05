public class Esp32{
     private String corrente;
    private String potencia;
    private String temperatura;
    private String umidade;
    private String espID;

    public Esp32(String corrente, String potencia, String temperatura, String umidade, String espID){
        this.corrente = corrente;
        this.potencia = potencia;
        this.temperatura = temperatura;
        this.umidade = umidade;
        this.espID = espID;
    }

         public String getCorrente() {
        return corrente;
    }
         public void setCorrente(String corrente) {
            this.corrente = corrente;
        }
    
    public String getPotencia() {
        return potencia;
    }
         public void setPotencia(String potencia) {
             this.potencia = potencia;
         }

    public String getTemperatura() {
        return temperatura;
    }
         public void setTemperatura(String temperatura) {
            this.temperatura = temperatura;
        }

    public String getUmidade(String umidade) {
        return umidade;
    }
         public void setUmidade(String umidade) {
            this.umidade = umidade;
        }

    public String getEspID(String espID) {
        return espID;
    }
         public void setEspID(String espID) {
            this.espID = espID;
        }

          public String toJson2(){
            return String.format(
               "{\"corrente\":\"%s\", \"potencia\":\"%s\", \"temperatura\":\"%s\", \"umidade\":\"%s\", \"espID\":\"%s\"}",
               this.corrente, this.potencia, this.temperatura, this.umidade, this.espID
            );
        }
}