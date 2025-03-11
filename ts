import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        // Obtener la zona horaria de México
        ZoneId mexicoZone = ZoneId.of("America/Mexico_City");
        
        // Obtener el timestamp actual en esa zona horaria
        ZonedDateTime timestampMexico = ZonedDateTime.now(mexicoZone);
        
        // Mostrar el timestamp
        System.out.println("Timestamp en México: " + timestampMexico);
        
        // Formatear el timestamp en un formato legible si es necesario
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedTimestamp = timestampMexico.format(formatter);
        System.out.println("Timestamp formateado: " + formattedTimestamp);
    }
}