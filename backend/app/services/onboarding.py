"""
Profession categories and onboarding system
Provides personalized suggestions based on profession type
"""
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User


# Profession Taxonomy
PROFESSION_CATEGORIES = {
    "music": {
        "name": "Música",
        "icon": "🎵",
        "sub_categories": [
            "Piano",
            "Violão",
            "Guitarra",
            "Bateria",
            "Canto",
            "Violino",
            "Flauta",
            "Saxofone",
            "Teoria Musical",
            "Produção Musical"
        ],
        "suggestions": {
            "groups": [
                {"name": "Iniciantes", "hourly_rate": 60, "max_students": 8},
                {"name": "Intermediário", "hourly_rate": 80, "max_students": 6},
                {"name": "Avançado", "hourly_rate": 100, "max_students": 4}
            ],
            "locations": [
                {"name": "Sala de Música", "type": "studio"},
                {"name": "Home Studio", "type": "home"},
                {"name": "Escola de Música", "type": "school"}
            ],
            "pricing": {
                "min": 50,
                "max": 150,
                "suggested": 80,
                "unit": "R$/hora"
            }
        }
    },
    "language": {
        "name": "Idiomas",
        "icon": "🌍",
        "sub_categories": [
            "Inglês",
            "Espanhol",
            "Francês",
            "Alemão",
            "Italiano",
            "Mandarim",
            "Japonês",
            "Coreano",
            "Português para Estrangeiros",
            "Libras"
        ],
        "suggestions": {
            "groups": [
                {"name": "Conversação", "hourly_rate": 70, "max_students": 6},
                {"name": "Business English", "hourly_rate": 100, "max_students": 4},
                {"name": "Preparatório TOEFL", "hourly_rate": 120, "max_students": 5}
            ],
            "locations": [
                {"name": "Sala Online (Zoom/Meet)", "type": "online"},
                {"name": "Escritório", "type": "office"},
                {"name": "Escola de Idiomas", "type": "school"}
            ],
            "pricing": {
                "min": 60,
                "max": 200,
                "suggested": 90,
                "unit": "R$/hora"
            }
        }
    },
    "academic": {
        "name": "Reforço Escolar",
        "icon": "📚",
        "sub_categories": [
            "Matemática",
            "Física",
            "Química",
            "Biologia",
            "Português",
            "História",
            "Geografia",
            "Inglês",
            "Redação",
            "Preparatório ENEM"
        ],
        "suggestions": {
            "groups": [
                {"name": "Fundamental I", "hourly_rate": 50, "max_students": 8},
                {"name": "Fundamental II", "hourly_rate": 60, "max_students": 6},
                {"name": "Ensino Médio", "hourly_rate": 80, "max_students": 5},
                {"name": "Pré-Vestibular", "hourly_rate": 100, "max_students": 4}
            ],
            "locations": [
                {"name": "Residência do Aluno", "type": "home"},
                {"name": "Biblioteca", "type": "library"},
                {"name": "Centro de Estudos", "type": "office"}
            ],
            "pricing": {
                "min": 40,
                "max": 150,
                "suggested": 70,
                "unit": "R$/hora"
            }
        }
    },
    "sports": {
        "name": "Esportes",
        "icon": "⚽",
        "sub_categories": [
            "Futebol",
            "Tênis",
            "Natação",
            "Vôlei",
            "Basquete",
            "Musculação",
            "Yoga",
            "Pilates",
            "Capoeira",
            "Artes Marciais"
        ],
        "suggestions": {
            "groups": [
                {"name": "Iniciantes", "hourly_rate": 60, "max_students": 10},
                {"name": "Intermediário", "hourly_rate": 80, "max_students": 8},
                {"name": "Avançado / Competição", "hourly_rate": 120, "max_students": 5}
            ],
            "locations": [
                {"name": "Academia", "type": "gym"},
                {"name": "Quadra Esportiva", "type": "court"},
                {"name": "Parque", "type": "outdoor"}
            ],
            "pricing": {
                "min": 50,
                "max": 200,
                "suggested": 90,
                "unit": "R$/hora"
            }
        }
    },
    "arts": {
        "name": "Artes",
        "icon": "🎨",
        "sub_categories": [
            "Desenho",
            "Pintura",
            "Escultura",
            "Fotografia",
            "Teatro",
            "Dança",
            "Design Gráfico",
            "Illustração Digital",
            "Aquarela",
            "Arte Urbana"
        ],
        "suggestions": {
            "groups": [
                {"name": "Iniciantes", "hourly_rate": 60, "max_students": 8},
                {"name": "Intermediário", "hourly_rate": 80, "max_students": 6},
                {"name": "Portfólio Profissional", "hourly_rate": 120, "max_students": 4}
            ],
            "locations": [
                {"name": "Ateliê", "type": "studio"},
                {"name": "Escola de Artes", "type": "school"},
                {"name": "Espaço Cultural", "type": "cultural"}
            ],
            "pricing": {
                "min": 50,
                "max": 180,
                "suggested": 85,
                "unit": "R$/hora"
            }
        }
    },
    "technology": {
        "name": "Tecnologia",
        "icon": "💻",
        "sub_categories": [
            "Programação Python",
            "Programação JavaScript",
            "Desenvolvimento Web",
            "Desenvolvimento Mobile",
            "Data Science",
            "Machine Learning",
            "Design UX/UI",
            "Excel Avançado",
            "Robótica",
            "Edição de Vídeo"
        ],
        "suggestions": {
            "groups": [
                {"name": "Fundamentos", "hourly_rate": 80, "max_students": 8},
                {"name": "Intermediário", "hourly_rate": 120, "max_students": 6},
                {"name": "Avançado / Especialização", "hourly_rate": 180, "max_students": 4}
            ],
            "locations": [
                {"name": "Sala de Informática", "type": "lab"},
                {"name": "Coworking", "type": "coworking"},
                {"name": "Online", "type": "online"}
            ],
            "pricing": {
                "min": 70,
                "max": 250,
                "suggested": 130,
                "unit": "R$/hora"
            }
        }
    },
    "business": {
        "name": "Negócios",
        "icon": "💼",
        "sub_categories": [
            "Administração",
            "Contabilidade",
            "Marketing Digital",
            "Vendas",
            "Recursos Humanos",
            "Gestão de Projetos",
            "Empreendedorismo",
            "Finanças",
            "Coaching",
            "Mentoria Empresarial"
        ],
        "suggestions": {
            "groups": [
                {"name": "Básico", "hourly_rate": 100, "max_students": 6},
                {"name": "Executivo", "hourly_rate": 150, "max_students": 4},
                {"name": "C-Level / Individual", "hourly_rate": 250, "max_students": 1}
            ],
            "locations": [
                {"name": "Escritório", "type": "office"},
                {"name": "Coworking", "type": "coworking"},
                {"name": "Online", "type": "online"}
            ],
            "pricing": {
                "min": 80,
                "max": 300,
                "suggested": 150,
                "unit": "R$/hora"
            }
        }
    },
    "wellness": {
        "name": "Bem-Estar",
        "icon": "🧘",
        "sub_categories": [
            "Yoga",
            "Meditação",
            "Pilates",
            "Nutrição",
            "Personal Trainer",
            "Psicologia",
            "Coaching de Vida",
            "Terapias Holísticas",
            "Massoterapia",
            "Fisioterapia"
        ],
        "suggestions": {
            "groups": [
                {"name": "Grupo Bem-Estar", "hourly_rate": 70, "max_students": 10},
                {"name": "Sessões Individuais", "hourly_rate": 120, "max_students": 1},
                {"name": "Programa Personalizado", "hourly_rate": 180, "max_students": 1}
            ],
            "locations": [
                {"name": "Estúdio", "type": "studio"},
                {"name": "Clínica", "type": "clinic"},
                {"name": "Domicílio", "type": "home"}
            ],
            "pricing": {
                "min": 60,
                "max": 250,
                "suggested": 110,
                "unit": "R$/hora"
            }
        }
    }
}


def get_all_categories() -> List[Dict]:
    """Get all profession categories"""
    return [
        {
            "key": key,
            "name": category["name"],
            "icon": category["icon"],
            "sub_categories": category["sub_categories"]
        }
        for key, category in PROFESSION_CATEGORIES.items()
    ]


def get_category_details(category_key: str) -> Optional[Dict]:
    """Get detailed information about a category"""
    return PROFESSION_CATEGORIES.get(category_key)


def get_suggestions_for_category(category_key: str) -> Optional[Dict]:
    """Get personalized suggestions for a profession category"""
    category = PROFESSION_CATEGORIES.get(category_key)
    if not category:
        return None
    
    return {
        "category": category["name"],
        "icon": category["icon"],
        "suggestions": category["suggestions"]
    }


def update_user_profession(user_id: str, category_key: str, sub_category: str, db: Session) -> bool:
    """
    Update user's profession information
    
    Args:
        user_id: User UUID
        category_key: Category key (e.g., 'music', 'language')
        sub_category: Specific profession (e.g., 'Piano', 'Inglês')
        db: Database session
    
    Returns:
        True if updated successfully
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    # Validate category exists
    if category_key not in PROFESSION_CATEGORIES:
        return False
    
    # Update user profession fields
    user.profession_category = category_key
    user.profession_sub_category = sub_category
    user.onboarding_completed = True
    user.onboarding_completed_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(user)
        return True
    except Exception as e:
        db.rollback()
        print(f"Error updating user profession: {e}")
        return False

