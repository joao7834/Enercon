public class Main {
    public static void main(String[] args) {
        Config GoodEvening = new Config();

        try {
            GoodEvening.iniciarServerJava();
        } catch (java.io.IOException e) {
            System.out.println("Erro ao iniciar o servidor: " + e.getMessage());
        }
        Cheddar GoodAfternoon = new  Cheddar();

        try{
            GoodAfternoon.iniciarServerJava2();
        }
        catch(java.io.IOException e){
            System.out.println("Erro ao iniciar o Segundo Servidor:" + e.getMessage());
        }
    }
}